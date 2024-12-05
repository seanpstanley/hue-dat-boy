// "use client";

// import { Clipboard } from "lucide-react";

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Button } from "@/components/ui/button";

// interface CopyColorProps {
//   color: string;
//   externalColor: string;
//   onChange: (color: string) => void;
//   className?: string;
// }

// export const CopyColor = ({color, }: CopyColorProps) => {
//   return (
//     <TooltipProvider>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Button
//             size="auto"
//             variant="ghost"
//             className="absolute size-12 right-4 top-1/2 -translate-y-1/2 p-2"
//             onClick={() => navigator.clipboard.writeText(rgbToHex(foreground))}
//           >
//             <Clipboard className="!size-full" />
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent
//           style={{
//             borderColor: getDisplayColor(
//               background,
//               foreground,
//               colorBlindnessType
//             ),
//             backgroundColor: rgbToHex(background),
//             color: getDisplayColor(background, foreground, colorBlindnessType),
//           }}
//         >
//           <span>copy color</span>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// };
