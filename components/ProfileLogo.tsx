import Avatar from 'boring-avatars';

interface ProfileLogoProps {
  url: string | null;
  name: string;
  color: string;
  size: string;
}

const ProfileLogo = ({ url, name, color, size }: ProfileLogoProps) => {
  const numericSize = parseInt(size, 10);

  // If no color ring is needed
  if (!color) {
    return (
      <div className="inline-block" style={{ position: 'relative', width: numericSize, height: numericSize }}>
        {url ? (
          <img
            src={url}
            alt={name || "User"}
            style={{
              width: numericSize,
              height: numericSize,
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Avatar name={name || "User"} colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}

            variant="beam" size={size} />
        )}
      </div>
    );
  }

  const ringThickness = 2;
  const whiteGap = 2;
  const avatarSize = numericSize - (ringThickness + whiteGap) * 2;

  return (
    <div
      style={{
        display: 'inline-block',
        border: `${whiteGap}px solid white`,
        outline: `${ringThickness}px solid ${color}`,
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    >
      {url ? (
        <img
          src={url}
          alt={name || "User"}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      ) : (
        <Avatar name={name || "User"} colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]} variant="beam" size={avatarSize} />


      )}

    </div>
  );
};

export default (ProfileLogo);
