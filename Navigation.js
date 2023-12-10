    import {NavigationContainer} from '@react-navigation/native';
    import {createNativeStackNavigator} from '@react-navigation/native-stack';
    import MenuScreen from './MenuScreen';
    import QuizScreen from './QuizScreen';
    import ResultScreen from './ResultScreen';


    const Stack = createNativeStackNavigator();

    export function Routes(){
        return(
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Menu">
                    <Stack.Screen name="Menu" component={MenuScreen} 
                        header={() => <></>}
                    />
                    <Stack.Screen name="Quiz" component={QuizScreen} 
                        header={() => <></>}
                    />
                    <Stack.Screen name="result" component={ResultScreen} 
                        header={() => <></>}
                    />
                    
                </Stack.Navigator>
            </NavigationContainer>
        )
    }

