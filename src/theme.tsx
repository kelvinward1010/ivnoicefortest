import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Roboto', sans-serif` },
        body: { value: `'Roboto', sans-serif` },
        mono: { value: `'Roboto', sans-serif` },
      },
      colors: {
        ui: {
          main: { value: "#009688" },
          secondary: { value: "#EDF2F7" },
          success: { value: "#48BB78" },
          danger: { value: "#E53E3E" },
          light: { value: "#FAFAFA" },
          dark: { value: "#1A202C" },
          darkSlate: { value: "#252D3D" },
          dim: { value: "#A0AEC0" },
        },
      },
    },
  },
})
