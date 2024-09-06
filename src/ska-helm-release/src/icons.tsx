import SvgIcon from '@mui/material/SvgIcon';

export function SvgDanger() {
  return (
    <SvgIcon fontSize="small" sx={{ width: '1rem', ml: '0.5rem' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"
        ></path>
      </svg>
    </SvgIcon>
  );
}
