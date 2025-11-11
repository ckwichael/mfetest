using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

// Swagger (optional but handy)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS so shell + MFEs (on other ports) can reach this
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

// In-memory store of registered MFEs
var store = new ConcurrentDictionary<string, MicrofrontendRegistration>();

// Register or update an MFE
app.MapPost("/api/mfe/register", (MicrofrontendRegistration reg) =>
{
    store[reg.Id] = reg;
    return Results.Ok();
});

// Get all MFEs
app.MapGet("/api/mfe", () => store.Values);

// Get MFEs that expose widgets for a slot (e.g. slot=dashboard)
app.MapGet("/api/mfe/widgets", (string slot) =>
{
    var result = store.Values.Where(m => m.Slots.Contains(slot));
    return Results.Ok(result);
});

// Get MFEs that expose pages
app.MapGet("/api/mfe/pages", () =>
{
    var result = store.Values.Where(m => !string.IsNullOrWhiteSpace(m.PageRoute));
    return Results.Ok(result);
});

app.Run();

// Manifest model used by shell + MFEs
public record MicrofrontendRegistration(
    string Id,
    string DisplayName,
    string RemoteEntryUrl,
    string PageRoute,
    string ExposedPageModule,
    string ExposedWidgetModule,
    string[] Slots,
    int Order
);
