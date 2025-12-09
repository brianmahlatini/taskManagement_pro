import React from 'react';
import { DragDropContext, DragDropContextProps } from 'react-beautiful-dnd';

interface DragDropContextWrapperProps extends DragDropContextProps {
  children: React.ReactNode;
}

export function DragDropContextWrapper({
  children,
  ...props
}: DragDropContextWrapperProps) {
  return (
    <DragDropContext {...props}>
      {children}
    </DragDropContext>
  );
}