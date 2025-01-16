// import { useCallback, useEffect, useRef } from "react";
// import { debounce } from "@/lib/utils";
// import { RgbColor } from "@/lib/types"

// const useHandleColorChange = (
//   setBackground: (color: RgbColor) => void,
//   setForeground: (color: RgbColor) => void,
//   setBackgroundHex: (hex: string) => void,
//   setForegroundHex: (hex: string) => void
// ) => {
//   // Create a ref to hold the debounced function
//   const debouncedUpdateRef = useRef<
//     (color: "background" | "foreground", value: string) => void & { cancel?: () => void }
//   >();

//   // Initialize the debounced function only once
//   if (!debouncedUpdateRef.current) {
//     debouncedUpdateRef.current = debounce(
//       (color: "background" | "foreground", value: string) => {
//         if (/^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
//           const colorValue = value.startsWith("#") ? value : `#${value}`;
//           const newColor = hexToRgb(colorValue);

//           if (color === "background") {
//             setBackground(newColor);
//             setBackgroundHex(colorValue);
//           } else {
//             setForeground(newColor);
//             setForegroundHex(colorValue);
//           }
//         }
//       },
//       50 // debounce delay
//     );
//   }

//   // Cleanup the debounced function on unmount
//   useEffect(() => {
//     return () => {
//       debouncedUpdateRef.current?.cancel?.(); // Safely call cancel if it exists
//     };
//   }, []);

//   // Return a callback function that calls the debounced function
//   const handleColorChange = useCallback(
//     (color: "background" | "foreground", value: string) => {
//       debouncedUpdateRef.current?.(color, value);
//     },
//     [] // No dependencies since the debounced function is stable
//   );

//   return handleColorChange;
// };

// export default useHandleColorChange;
