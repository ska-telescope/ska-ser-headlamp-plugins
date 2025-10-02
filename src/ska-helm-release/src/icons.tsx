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

export function SvgExternal() {
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
          d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"
        ></path>
      </svg>
    </SvgIcon>
  );
}

export function SvgLocal() {
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
          d="M20 18H4V8H20M20 6H12L10 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V8A2 2 0 0 0 20 6M14 9H16V13H19L15 17L11 13H14Z"
        ></path>
      </svg>
    </SvgIcon>
  );
}
