import React from "react"
import IconProps from "../types/icon-type"

const CartIcon: React.FC<IconProps> = ({
  size = "24",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        d="M5.70291 11.7848L4.18457 5.34766H16.6736C17.3175 5.34766 17.7893 5.89045 17.633 6.45189L16.2997 11.242C16.0969 11.9695 15.4084 12.5043 14.5776 12.579L7.83552 13.1848C6.83054 13.2745 5.91162 12.6713 5.70291 11.7848V11.7848Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.18418 5.34722L3.54123 2.68213H1.83594"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.2117 15.7988C13.7978 15.7988 13.4618 16.1349 13.4659 16.5488C13.4659 16.9628 13.8019 17.2988 14.2158 17.2988C14.6298 17.2988 14.9658 16.9628 14.9658 16.5488C14.9638 16.1349 14.6277 15.7988 14.2117 15.7988Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.20104 15.7988C6.78655 15.7988 6.45003 16.1344 6.45414 16.5478C6.45003 16.9632 6.7886 17.2988 7.20309 17.2988C7.61758 17.2988 7.9541 16.9632 7.9541 16.5499C7.9541 16.1344 7.61758 15.7988 7.20104 15.7988Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export default CartIcon
