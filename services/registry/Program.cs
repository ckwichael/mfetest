// services/registry/Program.cs
using System.Collections.Concurrent;
using System.Text.Json.Serialization;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; // << change
});

// CORS: allow shell & MFEs to talk to the registry from other ports
builder.Services.AddCors(o =>
{
    o.AddPolicy("AllowAll", p =>
        p.AllowAnyOrigin()
         .AllowAnyHeader()
         .AllowAnyMethod());
});

// In-memory store
builder.Services.AddSingleton<RegistryStore>();

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Health
app.MapGet("/healthz", () => Results.Ok(new { ok = true }));

// ---- Models / DTOs ----
app.MapPost("/api/mfe/register", (MicrofrontendRegistrationDto dto, RegistryStore store) =>
{
    // Back-compat: accept remoteEntryUrl and map to remoteModuleUrl if needed
    var remoteModuleUrl = dto.RemoteModuleUrl ?? dto.RemoteEntryUrl;
    if (string.IsNullOrWhiteSpace(dto.Id) || string.IsNullOrWhiteSpace(dto.DisplayName) || string.IsNullOrWhiteSpace(remoteModuleUrl))
        return Results.BadRequest(new { error = "Id, DisplayName, and RemoteModuleUrl/RemoteEntryUrl are required." });

    var reg = new MicrofrontendRegistration
    {
        Id = dto.Id.Trim(),
        DisplayName = dto.DisplayName.Trim(),
        RemoteModuleUrl = remoteModuleUrl.Trim(),
        Order = dto.Order,
        Capabilities = dto.Capabilities ?? new Capabilities { Widget = true, Page = true, Slots = new() },
        // Optional metadata you may still want to keep
        PageRoute = dto.PageRoute
    };

    store.Upsert(reg);
    return Results.Ok(reg);
});

app.MapGet("/api/mfe", (RegistryStore store) =>
{
    var all = store.All().OrderBy(r => r.Order).ToArray();
    return Results.Ok(all);
});

// Widgets filtered by slot (default = "dashboard")
app.MapGet("/api/mfe/widgets", (RegistryStore store, string? slot) =>
{
    var targetSlot = string.IsNullOrWhiteSpace(slot) ? "dashboard" : slot!;
    var items = store.All()
        .Where(r => r.Capabilities?.Widget == true &&
                    (r.Capabilities?.Slots?.Count == 0 ||
                     r.Capabilities?.Slots?.Contains(targetSlot, StringComparer.OrdinalIgnoreCase) == true))
        .OrderBy(r => r.Order)
        .Select(r => new
        {
            r.Id,
            r.DisplayName,
            r.RemoteModuleUrl,
            r.Order,
            r.Capabilities
        });
    return Results.Ok(items);
});

// Pages (any MFE that exposes a page)
app.MapGet("/api/mfe/pages", (RegistryStore store) =>
{
    var items = store.All()
        .Where(r => r.Capabilities?.Page == true)
        .OrderBy(r => r.Order)
        .Select(r => new
        {
            r.Id,
            r.DisplayName,
            r.RemoteModuleUrl,
            r.Order,
            r.Capabilities,
            r.PageRoute
        });
    return Results.Ok(items);
});

app.Run();


// ======= Types & Store =======

public class Capabilities
{
    public bool Widget { get; set; } = true;
    public bool Page { get; set; } = true;
    public List<string>? Slots { get; set; } = new();
}

public class MicrofrontendRegistration
{
    public required string Id { get; set; }
    public required string DisplayName { get; set; }
    public required string RemoteModuleUrl { get; set; }  // ES module URL (used by the shell's import())
    public int Order { get; set; } = 100;
    public Capabilities? Capabilities { get; set; }
    // Optional: keep if your shell shows a "route" or you plan to add routing metadata later
    public string? PageRoute { get; set; }
}

// Accept both the new and legacy field names on POST
public class MicrofrontendRegistrationDto
{
    public string Id { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string? RemoteModuleUrl { get; set; }
    public string? RemoteEntryUrl { get; set; } // legacy, still accepted
    public int Order { get; set; } = 100;
    public Capabilities? Capabilities { get; set; }
    public string? PageRoute { get; set; }
}

public class RegistryStore
{
    private readonly ConcurrentDictionary<string, MicrofrontendRegistration> _items = new(StringComparer.OrdinalIgnoreCase);

    public void Upsert(MicrofrontendRegistration reg) => _items.AddOrUpdate(reg.Id, reg, (_, __) => reg);

    public IEnumerable<MicrofrontendRegistration> All() => _items.Values;
}
