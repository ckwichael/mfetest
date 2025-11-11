// frontends/shell/src/VanillaMount.tsx
import React, { useEffect, useRef } from "react";

type Props = { factory: (props: any) => HTMLElement | DocumentFragment; props?: any };

const VanillaMount: React.FC<Props> = ({ factory, props }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        const node = factory?.(props ?? {});
        if (node) ref.current.appendChild(node);
        return () => { if (node && ref.current?.contains(node)) ref.current.removeChild(node); };
    }, [factory, props]);
    return <div ref={ref} />;
};

export default VanillaMount;
