import React, { Children } from "react"
import clsx from "clsx"

import Spinner, { SpinnerProps } from "../../atoms/spinner"

export type ButtonProps = {
  variant: "primary" | "secondary" | "ghost" | "danger" | "nuclear"
  size?: "small" | "medium" | "large"
  loading?: boolean
  spanClassName?: string
  spinnerConfig?: SpinnerProps
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "large",
      loading = false,
      spanClassName,
      spinnerConfig,
      children,
      ...attributes
    },
    ref
  ) => {
    const handleClick = (e) => {
      if (!loading && attributes.onClick) {
        attributes.onClick(e)
      }
    }

    const variantClassname = clsx({
      ["btn-primary"]: variant === "primary",
      ["btn-secondary"]: variant === "secondary",
      ["btn-ghost"]: variant === "ghost",
      ["btn-danger"]: variant === "danger",
      ["btn-nuclear"]: variant === "nuclear",
    })

    const sizeClassname = clsx({
      ["btn-large"]: size === "large",
      ["btn-medium"]: size === "medium",
      ["btn-small"]: size === "small",
    })

    return (
      <button
        {...attributes}
        className={clsx(
          "btn",
          variantClassname,
          sizeClassname,
          attributes.className
        )}
        disabled={attributes.disabled || loading}
        ref={ref}
        onClick={handleClick}
      >
        {loading ? (
          <Spinner size={size} variant={"secondary"} {...spinnerConfig} />
        ) : (
          Children.map(children, (child, i) => {
            return (
              <span
                key={i}
                className={clsx("mr-xsmall last:mr-0", spanClassName)}
              >
                {child}
              </span>
            )
          })
        )}
      </button>
    )
  }
)

export default Button
