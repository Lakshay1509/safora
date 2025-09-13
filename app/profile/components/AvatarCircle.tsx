"use client"

import React from 'react';
import Avatar from 'react-avatar';

interface Props {
  url: string | null | undefined;
  name:string | null | undefined;
  size?: string;
}

const AvatarCircle = ({ url ,name, size = "20"}: Props) => {
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
};

export default AvatarCircle;
