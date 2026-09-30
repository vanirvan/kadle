import type { SVGProps } from "react";

// add icons from https://icones.js.org/collection/material-symbols
// use "rounded" variant
// rename component name to `[icon-name]Icon`

export function UndoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M8 19q-.425 0-.712-.288T7 18t.288-.712T8 17h6.1q1.575 0 2.738-1T18 13.5T16.838 11T14.1 10H7.8l1.9 1.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275L4.7 9.7q-.15-.15-.213-.325T4.426 9t.063-.375T4.7 8.3l3.6-3.6q.275-.275.7-.275t.7.275t.275.7t-.275.7L7.8 8h6.3q2.425 0 4.163 1.575T20 13.5t-1.737 3.925T14.1 19z"
      />
    </svg>
  );
}

export function RedoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16.2 10H9.9q-1.575 0-2.738 1T6 13.5T7.163 16T9.9 17H16q.425 0 .713.288T17 18t-.288.713T16 19H9.9q-2.425 0-4.163-1.575T4 13.5t1.738-3.925T9.9 8h6.3l-1.9-1.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.6 3.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-3.6 3.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"
      />
    </svg>
  );
}

export function DeleteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3.713-4.288Q11 16.426 11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17t.713-.288m4 0Q15 16.426 15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17t.713-.288"
      />
    </svg>
  );
}
