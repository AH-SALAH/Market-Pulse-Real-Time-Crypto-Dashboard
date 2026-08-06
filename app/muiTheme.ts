import { createTheme } from '@mui/material/styles';

// MUI theme mirroring the app's design tokens (app/_variables.scss). The app is
// dark-only; keeping the palette here means MUI components (Select, TextField,
// Menu, Popover) pick up the same surfaces/borders/text as the Tailwind styles
// instead of MUI's default light theme.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6' },
    success: { main: '#10b981' },
    error: { main: '#ef4444' },
    background: { default: '#0f172a', paper: '#0f172a' },
    divider: '#334155',
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  components: {
    // MUI dark mode adds an elevation gradient overlay to Paper — flatten it so
    // surfaced menus/popovers match the flat slate cards everywhere else.
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f172a',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1e293b' },
          '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
            borderColor: '#334155',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b82f6',
            borderWidth: 1,
          },
          '& .MuiInputBase-input': {
            color: '#e2e8f0',
            '&::placeholder': { color: '#475569', opacity: 1 },
          },
          '& .MuiSelect-icon': { color: '#94a3b8' },
        },
        // Both Select and TextField render an OutlinedInput; pin the small size
        // to a uniform 36px so the two filters sit on the same baseline.
        sizeSmall: {
          height: 36,
          '& .MuiSelect-select': {
            display: 'inline-flex',
            alignItems: 'center',
            paddingTop: 0,
            paddingBottom: 0,
          },
          '& .MuiInputBase-input': {
            paddingTop: 0,
            paddingBottom: 0,
            height: '100%',
            boxSizing: 'border-box',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#e2e8f0',
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.16)',
            color: '#ffffff',
          },
          '&.Mui-selected:hover': { backgroundColor: 'rgba(59, 130, 246, 0.22)' },
          '&.Mui-selected.Mui-focusVisible': {
            backgroundColor: 'rgba(59, 130, 246, 0.22)',
          },
          '&:hover': { backgroundColor: 'rgba(51, 65, 85, 0.5)' },
          '&.Mui-focusVisible': { backgroundColor: 'rgba(51, 65, 85, 0.5)' },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { backgroundColor: '#0f172a' },
      },
    },
  },
});

export default theme;
