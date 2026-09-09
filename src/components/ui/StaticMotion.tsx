import type { ButtonHTMLAttributes, HTMLAttributes, NavHTMLAttributes, ReactNode, SpanHTMLAttributes } from 'react';

type MotionExtras = {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  variants?: unknown;
  transition?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
};

type StaticDivProps = HTMLAttributes<HTMLDivElement> & MotionExtras;
type StaticNavProps = NavHTMLAttributes<HTMLElement> & MotionExtras;
type StaticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & MotionExtras;
type StaticSpanProps = SpanHTMLAttributes<HTMLSpanElement> & MotionExtras;

function removeMotionProps(props: MotionExtras): MotionExtras {
  const { initial: _initial, animate: _animate, exit: _exit, variants: _variants, transition: _transition, whileHover: _whileHover, whileTap: _whileTap, whileInView: _whileInView, viewport: _viewport, ...rest } = props;
  return rest;
}

export function StaticDiv({ children, ...props }: StaticDivProps) {
  return <div {...removeMotionProps(props)}>{children}</div>;
}

export function StaticNav({ children, ...props }: StaticNavProps) {
  return <nav {...removeMotionProps(props)}>{children}</nav>;
}

export function StaticButton({ children, ...props }: StaticButtonProps) {
  return <button {...removeMotionProps(props)}>{children}</button>;
}

export function StaticSpan({ children, ...props }: StaticSpanProps) {
  return <span {...removeMotionProps(props)}>{children}</span>;
}

export const staticMotion = {
  div: StaticDiv,
  nav: StaticNav,
  button: StaticButton,
  span: StaticSpan,
};

export type StaticMotionNode = ReactNode;
