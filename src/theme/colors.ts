export const greenTheme = {
  primary: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#2E7D32',
    contrast: '#FFFFFF'
  },
  secondary: {
    light: '#A5D6A7',
    main: '#66BB6A',
    dark: '#2E7D32',
    contrast: '#FFFFFF'
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
    green: 'rgba(76, 175, 80, 0.05)',
    card: '#FFFFFF'
  },
  text: {
    primary: '#1B5E20',
    secondary: '#4CAF50',
    disabled: '#9E9E9E',
    hint: '#757575'
  },
  finance: {
    income: '#4CAF50',
    expense: '#F44336',
    neutral: '#FF9800',
    incomeLight: '#E8F5E9',
    expenseLight: '#FFEBEE'
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  },
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    focus: '#4CAF50'
  }
};

export const darkTheme = {
  ...greenTheme,
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    green: 'rgba(76, 175, 80, 0.1)',
    card: '#2D2D2D'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#81C784',
    disabled: '#757575',
    hint: '#9E9E9E'
  },
  border: {
    light: '#2D2D2D',
    main: '#404040',
    focus: '#4CAF50'
  }
};
