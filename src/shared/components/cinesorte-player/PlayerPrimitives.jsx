import { forwardRef } from "react";

export const PlayerViewport = forwardRef(function PlayerViewport({ children, className = "" }, ref) {
  return <div ref={ref} className={`relative overflow-hidden bg-black ${className}`}>{children}</div>;
});

export function PlayerControlButton({ children, className = "", ...props }) {
  return <button type="button" className={`cine-player-control ${className}`} {...props}>{children}</button>;
}
