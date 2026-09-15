import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RoleHeaderButton } from '../components/RolePicker';
import { IntakeScreen } from '../screens/IntakeScreen';
import { PapQueueScreen } from '../screens/PapQueueScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import { PatientsScreen } from '../screens/PatientsScreen';
import { colors, type } from '../theme';
import type { PatientsStackParamList } from './types';

const Tab = createBottomTabNavigator();
const PatientsStack = createNativeStackNavigator<PatientsStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border },
};

function PatientsNavigator() {
  return (
    <PatientsStack.Navigator
      screenOptions={{
        headerTitleStyle: { ...type.heading, color: colors.text },
        headerTintColor: colors.primary,
        headerRight: () => <RoleHeaderButton />,
      }}
    >
      <PatientsStack.Screen name="PatientList" component={PatientsScreen} options={{ title: 'Patients' }} />
      <PatientsStack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: 'Patient chart' }}
      />
    </PatientsStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          headerTitleStyle: { ...type.heading, color: colors.text },
          headerRight: () => <RoleHeaderButton />,
        }}
      >
        <Tab.Screen
          name="PatientsTab"
          component={PatientsNavigator}
          options={{
            title: 'Patients',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="IntakeTab"
          component={IntakeScreen}
          options={{
            title: 'Intake',
            tabBarLabel: 'Intake',
            tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="PapTab"
          component={PapQueueScreen}
          options={{
            title: 'PAP Queue',
            tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
