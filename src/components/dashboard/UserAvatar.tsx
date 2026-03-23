interface UserAvatarProps {
  avatarUrl: string | null;
  displayName: string | null;
  size?: number;
}

const UserAvatar = ({ avatarUrl, displayName, size = 42 }: UserAvatarProps) => {
  const initial = (displayName || "U").charAt(0).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || "Avatar"}
        className="object-cover flex-shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: 12,
        }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center font-display font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: "#1E3A5F",
        color: "white",
        fontSize: size * 0.38,
      }}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
