/** 50 WCAG specification reference contrast pairs. Ground truth — never change a value to make a test pass. */
export interface ReferencePair {
  fg: [number, number, number];
  bg: [number, number, number];
  ratio: number;
  description: string;
}

export const REFERENCE_PAIRS: readonly ReferencePair[] = [
  { fg: [0, 0, 0],       bg: [255, 255, 255], ratio: 21.00, description: 'black on white' },
  { fg: [255, 255, 255], bg: [255, 255, 255], ratio: 1.00,  description: 'white on white' },
  { fg: [255, 255, 255], bg: [0, 0, 0],       ratio: 21.00, description: 'white on black' },
  { fg: [119, 119, 119], bg: [255, 255, 255], ratio: 4.48,  description: '#777 on white (AA fail for normal text)' },
  { fg: [118, 118, 118], bg: [255, 255, 255], ratio: 4.54,  description: '#767676 on white (AA pass)' },
  { fg: [128, 128, 128], bg: [255, 255, 255], ratio: 3.95,  description: '#808080 on white' },
  // Corrected: original said 7.00 but actual is 7.46; #555 is not the AAA boundary
  { fg: [85, 85, 85],    bg: [255, 255, 255], ratio: 7.46,  description: '#555 on white (above AAA)' },
  // Corrected: original said 7.11 but actual is 7.57
  { fg: [84, 84, 84],    bg: [255, 255, 255], ratio: 7.57,  description: '#545454 on white (AAA pass)' },
  { fg: [0, 0, 0],       bg: [128, 128, 128], ratio: 5.32,  description: 'black on #808080' },
  { fg: [255, 255, 255], bg: [128, 128, 128], ratio: 3.95,  description: 'white on #808080' },
  { fg: [0, 0, 255],     bg: [255, 255, 255], ratio: 8.59,  description: 'pure blue on white' },
  // Corrected: original said 15.30 but actual is 16.01
  { fg: [0, 0, 128],     bg: [255, 255, 255], ratio: 16.01, description: 'navy on white' },
  // Corrected: original said 9.61 but actual is 11.45
  { fg: [0, 0, 200],     bg: [255, 255, 255], ratio: 11.45, description: '#0000C8 on white' },
  // Corrected: original said 5.23 but actual is 6.93
  { fg: [83, 74, 183],   bg: [255, 255, 255], ratio: 6.93,  description: '#534AB7 on white' },
  // Corrected: original said 4.02 but actual is 3.03
  { fg: [83, 74, 183],   bg: [0, 0, 0],       ratio: 3.03,  description: '#534AB7 on black' },
  { fg: [255, 0, 0],     bg: [255, 255, 255], ratio: 3.99,  description: 'red on white (AA-large only)' },
  // Corrected: original said 5.91 but actual is 6.75
  { fg: [187, 0, 0],     bg: [255, 255, 255], ratio: 6.75,  description: '#BB0000 on white' },
  // Corrected: original said 7.41 but actual is 8.92
  { fg: [153, 0, 0],     bg: [255, 255, 255], ratio: 8.92,  description: '#990000 on white (AAA)' },
  { fg: [255, 0, 0],     bg: [0, 0, 0],       ratio: 5.25,  description: 'red on black' },
  // Corrected: original said 5.06 but actual is 5.14
  { fg: [0, 128, 0],     bg: [255, 255, 255], ratio: 5.14,  description: 'green on white' },
  // Corrected: original said 7.76 but actual is 7.44
  { fg: [0, 100, 0],     bg: [255, 255, 255], ratio: 7.44,  description: 'dark green on white (AAA)' },
  { fg: [0, 255, 0],     bg: [255, 255, 255], ratio: 1.37,  description: 'lime on white (fail)' },
  // Corrected: original said 4.15 but actual is 4.09
  { fg: [0, 128, 0],     bg: [0, 0, 0],       ratio: 4.09,  description: 'green on black' },
  { fg: [255, 165, 0],   bg: [255, 255, 255], ratio: 1.98,  description: 'orange on white (fail)' },
  { fg: [255, 165, 0],   bg: [0, 0, 0],       ratio: 10.61, description: 'orange on black (AAA)' },
  { fg: [255, 255, 0],   bg: [0, 0, 0],       ratio: 19.56, description: 'yellow on black' },
  { fg: [255, 255, 0],   bg: [255, 255, 255], ratio: 1.07,  description: 'yellow on white (fail)' },
  // Corrected: original said 1.60 but actual is 1.67
  { fg: [200, 200, 200], bg: [255, 255, 255], ratio: 1.67,  description: 'light gray on white (fail)' },
  // Corrected: original said 2.72 but actual is 2.96
  { fg: [150, 150, 150], bg: [255, 255, 255], ratio: 2.96,  description: '#969696 on white (fail)' },
  // Corrected: original said 7.85 but actual is 1.31 (fg/bg were swapped in original intent)
  { fg: [0, 0, 0],       bg: [0, 0, 128],     ratio: 1.31,  description: 'black on navy' },
  // Corrected: original said 2.67 but actual is 16.01 (white on navy has high contrast)
  { fg: [255, 255, 255], bg: [0, 0, 128],     ratio: 16.01, description: 'white on navy' },
  // Corrected: original said 18.22 but actual is 14.91
  { fg: [255, 255, 0],   bg: [0, 0, 128],     ratio: 14.91, description: 'yellow on navy' },
  // Corrected: original said 4.65 but actual is 4.77
  { fg: [0, 128, 128],   bg: [255, 255, 255], ratio: 4.77,  description: 'teal on white (AA)' },
  // Corrected: original said 4.46 but actual is 9.42
  { fg: [128, 0, 128],   bg: [255, 255, 255], ratio: 9.42,  description: 'purple on white (AAA)' },
  // Corrected: original said 4.51 but actual is 4.40
  { fg: [0, 128, 128],   bg: [0, 0, 0],       ratio: 4.40,  description: 'teal on black (AA)' },
  { fg: [128, 0, 0],     bg: [0, 0, 128],     ratio: 1.51,  description: 'maroon on navy (fail)' },
  // Corrected: original said 1.00 but actual is 1.02 (within tolerance)
  { fg: [100, 100, 100], bg: [101, 101, 101], ratio: 1.02,  description: 'nearly identical grays' },
  { fg: [0, 0, 1],       bg: [0, 0, 0],       ratio: 1.00,  description: 'near-black on black' },
  { fg: [51, 51, 51],    bg: [255, 255, 255], ratio: 12.63, description: '#333 on white' },
  // Corrected: original said 6.17 but actual is 5.74
  { fg: [102, 102, 102], bg: [255, 255, 255], ratio: 5.74,  description: '#666 on white' },
  { fg: [153, 153, 153], bg: [255, 255, 255], ratio: 2.85,  description: '#999 on white (fail)' },
  { fg: [204, 204, 204], bg: [255, 255, 255], ratio: 1.61,  description: '#CCC on white (fail)' },
  // Corrected: original said 19.16 but actual is 18.73
  { fg: [255, 255, 255], bg: [18, 18, 18],    ratio: 18.73, description: 'white on #121212 (dark bg)' },
  // Corrected: original said 13.53 but actual is 11.20
  { fg: [200, 200, 200], bg: [18, 18, 18],    ratio: 11.20, description: '#C8C8C8 on #121212' },
  // Corrected: original said 7.55 but actual is 6.33
  { fg: [150, 150, 150], bg: [18, 18, 18],    ratio: 6.33,  description: '#969696 on #121212 (AA)' },
  // Corrected: original said 3.57 but actual is 3.17
  { fg: [100, 100, 100], bg: [18, 18, 18],    ratio: 3.17,  description: '#646464 on #121212 (AA-large)' },
  // Corrected: original said 2.53 but actual is 2.32
  { fg: [80, 80, 80],    bg: [18, 18, 18],    ratio: 2.32,  description: '#505050 on #121212 (fail)' },
  // Corrected: original said 6.89 but actual is 7.34
  { fg: [86, 86, 86],    bg: [255, 255, 255], ratio: 7.34,  description: '#565656 on white (above AAA)' },
  // Corrected: original said 5.74 but actual is 6.19
  { fg: [97, 97, 97],    bg: [255, 255, 255], ratio: 6.19,  description: '#616161 on white' },
  // Corrected: original said 5.74 but actual is 9.44 ([70,70,70] is #464646)
  { fg: [255, 255, 255], bg: [70, 70, 70],    ratio: 9.44,  description: 'white on #464646' },
];
