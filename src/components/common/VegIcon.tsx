/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface VegIconProps {
  isVeg: boolean;
  size?: number;
}

export const VegIcon: React.FC<VegIconProps> = ({ isVeg, size = 16 }) => {
  if (isVeg) {
    return (
      <span
        title="Pure Vegetarian"
        className="inline-flex items-center justify-center border-2 border-emerald-500 rounded p-0.5 bg-emerald-950/30"
        style={{ width: size, height: size }}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className="inline-flex items-center justify-center border-2 border-red-500 rounded p-0.5 bg-red-950/30"
      style={{ width: size, height: size }}
    >
      <span className="w-0 h-0 border-x-4 border-x-transparent border-b-[7px] border-b-red-500" />
    </span>
  );
};
