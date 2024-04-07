import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';

interface GridState {
  [key: string]: string;
}

const initialGrid = [
  // [5, 3, 0, 0, 7, 0, 0, 0, 0],
  // [6, 0, 0, 1, 9, 5, 0, 0, 0],
  // [0, 9, 8, 0, 0, 0, 0, 6, 0],
  // [8, 0, 0, 0, 6, 0, 0, 0, 3],
  // [4, 0, 0, 8, 0, 3, 0, 0, 1],
  // [7, 0, 0, 0, 2, 0, 0, 0, 6],
  // [0, 6, 0, 0, 0, 0, 2, 8, 0],
  // [0, 0, 0, 4, 1, 9, 0, 0, 5],
  // [0, 0, 0, 0, 8, 0, 0, 7, 9]

  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

const initialGridState: GridState = {};

const App: React.FC = () => {
  const [gridState, setGridState] = useState<GridState>(initialGridState);

  const handleInputChange = (text: string, key: string) => {
    setGridState({ ...gridState, [key]: text });
  };

  const renderGrid = () => {
    const grid = [];
    const gridColors = ['#ffc8dd', '#DD9',]; // Array of background colors for the grids

    for (let i = 0; i < 9; i++) {
      const row = [];
      for (let j = 0; j < 9; j++) {
        const key = `${i}-${j}`;
        const initialValue = initialGrid[i][j] !== 0 ? initialGrid[i][j].toString() : '';
        const gridColorIndex = Math.floor(i / 3) % 2 === Math.floor(j / 3) % 2 ? 0 : 1; // Determine grid color
        row.push(
          <TextInput
            key={key}
            style={[styles.input, determineBorderStyle(i, j), { backgroundColor: gridColors[gridColorIndex] }]}
            onChangeText={(text) => handleInputChange(text, key)}
            value={gridState[key] || initialValue}
            keyboardType="numeric"
            maxLength={1}
          />
        );
      }
      grid.push(
        <View key={i} style={styles.row}>
          {row}
        </View>
      );
    }
    return grid;
  };

  const determineBorderStyle = (rowIndex: number, colIndex: number) => {
    const borderStyle: { borderTopWidth?: number; borderLeftWidth?: number } = {};
    if (rowIndex % 3 === 0 && rowIndex !== 0) {
      borderStyle.borderTopWidth = 2;
    }
    if (colIndex % 3 === 0 && colIndex !== 0) {
      borderStyle.borderLeftWidth = 2;
    }
    return borderStyle;
  };

  const handleReset = () => {
    setGridState(initialGridState);
  };

  const handleSave = () => {
    const parsedGrid = parseGrid();
    if (parsedGrid.flat().includes(0)) {
      // If there are empty fields, show an error message
      Alert.alert('Error', 'Please fill all fields before solving.');
    } else {
      // If all fields are filled, attempt to solve the puzzle
      if (solveSudoku(parsedGrid)) {
        Alert.alert('Success', 'Sudoku puzzle solved successfully!');
      } else {
        Alert.alert('Error', 'Unable to solve Sudoku puzzle. Invalid input.');
      }
    }
  };

  const solveSudoku = (grid: number[][]): boolean => {
    const findEmptyLocation = (): [number, number] | null => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            return [row, col];
          }
        }
      }
      return null;
    };

    const isValid = (row: number, col: number, num: number): boolean => {
      for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) {
          return false;
        }
      }
      const boxRowStart = Math.floor(row / 3) * 3;
      const boxColStart = Math.floor(col / 3) * 3;
      for (let i = boxRowStart; i < boxRowStart + 3; i++) {
        for (let j = boxColStart; j < boxColStart + 3; j++) {
          if (grid[i][j] === num) {
            return false;
          }
        }
      }
      return true;
    };

    const solve = (): boolean => {
      const emptyLocation = findEmptyLocation();
      if (!emptyLocation) {
        return true; // Sudoku solved
      }
      const [row, col] = emptyLocation;
      for (let num = 1; num <= 9; num++) {
        if (isValid(row, col, num)) {
          grid[row][col] = num;
          if (solve()) {
            return true;
          }
          grid[row][col] = 0; // Backtrack
        }
      }
      return false; // No solution found
    };

    return solve();
  };

  const parseGrid = (): number[][] => {
    const parsedGrid: number[][] = [];
    for (let i = 0; i < 9; i++) {
      const row: number[] = [];
      for (let j = 0; j < 9; j++) {
        const key = `${i}-${j}`;
        row.push(parseInt(gridState[key] || initialGrid[i][j].toString()));
      }
      parsedGrid.push(row);
    }
    return parsedGrid;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sudoku</Text>
      <View style={styles.grid}>{renderGrid()}</View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.solveButton, { backgroundColor: '#80ed99' }]} onPress={handleSave}>
          <Text style={styles.solveButtonText}>Solve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.solveButton, { backgroundColor: '#d00000' }]} onPress={handleReset}>
          <Text style={styles.solveButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    width: 40,
    height: 40,
    textAlign: 'center',
    margin: 1,
    color: 'black'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%'
  },
  solveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  solveButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default App;