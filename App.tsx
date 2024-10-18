import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar'; 


type RootStackParamList = {
  HomeScreen: undefined;
  DifficultyScreen: undefined;
  GameScreen: { difficulty: number };
  ResultScreen: { score: number };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;
type DifficultyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DifficultyScreen'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameScreen'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;
type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResultScreen'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'ResultScreen'>;

type EquationData = {
  equation: string;
  answer: number;
};


const generateEquation = (difficulty: number): EquationData => {
  const num1 = Math.floor(Math.random() * 10 * difficulty) + 1;
  const num2 = Math.floor(Math.random() * 10 * difficulty) + 1;
  const operations = ['+', '-', '*', '/'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let answer: number;
  switch (operation) {
    case '+':
      answer = num1 + num2;
      break;
    case '-':
      answer = num1 - num2;
      break;
    case '*':
      answer = num1 * num2;
      break;
    case '/':
      answer = parseFloat((num1 / num2).toFixed(2));
      break;
    default:
      answer = 0;
  }
  return { equation: `${num1} ${operation} ${num2}`, answer };
};

// Home Screen 
const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Arithmetic Training</Text>
    <Text style={styles.subtitle}>Pass the magical math exam!</Text>
    <TouchableOpacity
      style={styles.startButton}
      onPress={() => navigation.navigate('DifficultyScreen')}
    >
      <Text style={styles.startButtonText}>Start Training</Text>
    </TouchableOpacity>
  </View>
);

// 1st Screen
const DifficultyScreen = ({ navigation }: { navigation: DifficultyScreenNavigationProp }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Select Difficulty</Text>
    <TouchableOpacity
      style={styles.difficultyButton}
      onPress={() => navigation.navigate('GameScreen', { difficulty: 1 })}
    >
      <Text style={styles.difficultyButtonText}>Apprentice</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.difficultyButton}
      onPress={() => navigation.navigate('GameScreen', { difficulty: 2 })}
    >
      <Text style={styles.difficultyButtonText}>Wizard</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.difficultyButton}
      onPress={() => navigation.navigate('GameScreen', { difficulty: 3 })}
    >
      <Text style={styles.difficultyButtonText}>Sorcerer</Text>
    </TouchableOpacity>
  </View>
);

// Game Screen
const GameScreen = ({
  route,
  navigation,
}: {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}) => {
  const { difficulty } = route.params;
  const [equationData, setEquationData] = useState<EquationData>(generateEquation(difficulty));
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  useEffect(() => {
    setTimeLimit(difficulty === 1 ? 30 : difficulty === 2 ? 20 : 15);
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (timer < timeLimit) {
          setTimer((prev) => prev + 1);
        } else {
          setIsRunning(false);
          finishGame();
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer]);

  const checkAnswer = () => {
    if (parseFloat(userAnswer) === equationData.answer) {
      setScore(score + 10);
      setTimeout(() => {
        setEquationData(generateEquation(difficulty));
        setUserAnswer('');
        setTimer(0);
        setIsRunning(true);
      }, 2000);
    } else {
      setUserAnswer('');
    }
  };

  const finishGame = () => {
    navigation.navigate('ResultScreen', { score });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.scenarioText}>Solve this equation:</Text>
      <Text style={styles.equation}>{equationData.equation}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your answer"
        value={userAnswer}
        onChangeText={setUserAnswer}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.solveButton} onPress={checkAnswer}>
        <Text style={styles.solveButtonText}>Submit Answer</Text>
      </TouchableOpacity>
      <Text style={styles.scoreText}>Score: {score}</Text>
      <Text style={styles.timerText}>Time: {timer}s</Text>
    </View>
  );
};

// Result Screen 
const ResultScreen = ({
  route,
  navigation,
}: {
  route: ResultScreenRouteProp;
  navigation: ResultScreenNavigationProp;
}) => {
  const { score } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.resultText}>Great Job!</Text>
      <Text style={styles.scoreText}>Your final score is: {score}</Text>
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Text style={styles.continueButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

// Navigation
const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="DifficultyScreen" component={DifficultyScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" /> 
    </NavigationContainer>
  );
};

export default App;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'aliceblue',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'purple',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: 'indigo',
  },
  startButton: {
    backgroundColor: 'purple',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  difficultyButton: {
    backgroundColor: 'blue',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  difficultyButtonText: {
    color: 'white',
    fontSize: 18,
  },
  scenarioText: {
    fontSize: 24,
    marginBottom: 10,
    color: 'darkslateblue',
  },
  equation: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'teal',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    width: '80%',
    fontSize: 18,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  solveButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 20,
  },
  solveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 22,
    marginTop: 20,
    color: 'darkgreen',
  },
  timerText: {
    fontSize: 22,
    marginTop: 10,
    color: 'darkred',
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'purple',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: 'purple',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 30,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
