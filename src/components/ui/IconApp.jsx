import { tokens } from "../../theme/tokens";


export default function IconApp({
    icon: Icon,
    size = "md",
    color = tokens.colors.black,
    strokeWidth = 1.5,
    style,
}) {
    
    if (!Icon) return null;

    return (
        <Icon
            size={typeof size === "number" ? size : tokens.iconSize[size]}
            color={color}
            strokeWidth={strokeWidth}
            style={style}
        />
    );
}
