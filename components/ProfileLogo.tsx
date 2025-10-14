"use client"

import React from 'react';
import Avatar from 'react-avatar';

interface Props {
  url: string | null | undefined;
  name: string | null | undefined;
  size?: string;
  color?: string;
}

const ProfileLogo = ({ url, name, size = "20", color }: Props) => {
  const numericSize = parseInt(size, 10);
  
  if (!color) {
    return (
      <div className="inline-block">
        <Avatar
          src={url || undefined}
          name={name || "User"}
          size={size}
          round={true}
        />
      </div>
    );
  }

  const ringThickness = 2; // Thickness of the outer colored ring
  const whiteGap = 2;      // Thickness of the inner white ring

  // Calculate the size of the avatar itself
  const avatarSize = numericSize - (ringThickness + whiteGap) * 2;

  return (
    // This wrapper div applies the border and outline effects.
    <div
      style={{
        display: 'inline-block',
        // The white ring is a border
        border: `${whiteGap}px solid white`,
        // The colored ring is an outline. It's drawn outside the border.
        outline: `${ringThickness}px solid ${color}`,
        borderRadius: '50%',
      }}
    >
      <Avatar
        src={url || undefined}
        name={name || "User"}
        size={String(avatarSize)}
        round={true}
      />
    </div>
  );
};

export default ProfileLogo;
