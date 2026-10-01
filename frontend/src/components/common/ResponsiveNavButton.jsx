import React from 'react';
import { Button, useAppShellMobile } from '@astryxdesign/core';

export const ResponsiveNavButton = (props) => {
  const { isMobile } = useAppShellMobile();
  const isIconOnly = isMobile && Boolean(props.icon);

  return (
    <Button
      {...props}
      isIconOnly={isIconOnly}
      tooltip={isIconOnly ? props.label : undefined}
    />
  );
};
