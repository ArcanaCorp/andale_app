import { Blobatar } from "@blobatar/react-native";

export default function Avatar ({ name, image, size = "md", style }) {

    const SIZES = {
        sm: 32,
        md: 48,
        lg: 64,
    };

    const avatarSize = SIZES[size] || SIZES.md;

    return (
        <>
            <Blobatar name={name} size={avatarSize} style={style} />
        </>
    )
}