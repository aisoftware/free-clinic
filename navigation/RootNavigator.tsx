import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { ComponentProps } from 'react';

import { RoleHeaderButton } from '../components/RolePicker';
import { AboutScreen } from '../screens/AboutScreen';
import { IntakeScreen } from '../screens/IntakeScreen';
import { PapQueueScreen } from '../screens/PapQueueScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import { PatientsScreen } from '../screens/PatientsScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { colors } from '../theme';
import { createStackNavigator, createTabNavigator } from './navigators';
import type { PatientsStackParamList, RootTabParamList } from './types';

const Tab = createTabNavigator<RootTabParamList>();
const PatientsStack = createStackNavigator<PatientsStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border },
};

type IconName = ComponentProps<typeof Ionicons>['name'];
const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) => <Ionicons name={name} color={color} size={size} />;

function PatientsNavigator() {
  return (
    <PatientsStack.Navigator
      screenOptions={{ headerRight: () => <RoleHeaderButton /> }}
    >
      <PatientsStack.Screen name="PatientList" component={PatientsScreen} options={{ title: 'Patients' }} />
      <PatientsStack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Patient chart' }} />
    </PatientsStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        initialRouteName="TodayTab"
        screenOptions={{ headerRight: () => <RoleHeaderButton /> }}
      >
        <Tab.Screen
          name="TodayTab"
          component={TodayScreen}
          // Today draws its own header with the clinic name, date, and role selector.
          options={{ title: 'Today', headerShown: false, tabBarIcon: tabIcon('today-outline') }}
        />
        <Tab.Screen
          name="PatientsTab"
          component={PatientsNavigator}
          options={{ title: 'Patients', headerShown: false, tabBarIcon: tabIcon('people-outline') }}
        />
        <Tab.Screen name="IntakeTab" component={IntakeScreen} options={{ title: 'Intake', tabBarLabel: 'Intake', tabBarIcon: tabIcon('clipboard-outline') }} />
        <Tab.Screen name="PapTab" component={PapQueueScreen} options={{ title: 'PAP Queue', tabBarIcon: tabIcon('medkit-outline') }} />
        <Tab.Screen name="AboutTab" component={AboutScreen} options={{ title: 'About', tabBarIcon: tabIcon('information-circle-outline') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
