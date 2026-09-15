import {
  createNavigatorFactory,
  type DefaultNavigatorOptions,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
  StackActions,
  type StackActionHelpers,
  type StackNavigationState,
  StackRouter,
  type StackRouterOptions,
  type TabActionHelpers,
  TabActions,
  type TabNavigationState,
  TabRouter,
  type TabRouterOptions,
  type TypedNavigator,
  useNavigationBuilder,
} from '@react-navigation/native';
import { ComponentType, ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, touchTarget } from '../theme';
import { Header, HeaderHeightContext } from './Header';

// Tab and stack navigators built on React Navigation's own routers. The published
// @react-navigation/bottom-tabs and /stack packages declare react-native-screens as a peer
// dependency, which Expo Snack cannot build; these keep the same navigation state,
// actions, and Android back handling without it.

export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerRight?: () => ReactNode;
  tabBarLabel?: string;
  tabBarIcon?: (props: { color: string; size: number }) => ReactNode;
}

type EventMap = { tabPress: { data: undefined; canPreventDefault: true } };

// ---- Tabs ------------------------------------------------------------------------------------

type TabProps = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  TabNavigationState<ParamListBase>,
  ScreenOptions,
  EventMap,
  NavigationProp<ParamListBase>
> &
  TabRouterOptions;

function TabNavigator({ id, initialRouteName, backBehavior, children, screenOptions }: TabProps) {
  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    ScreenOptions,
    EventMap
  >(TabRouter, { id, initialRouteName, backBehavior, children, screenOptions });
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  // Screens mount on first visit and then stay mounted, so search text and scroll survive tab switches.
  const [visited, setVisited] = useState<Set<string>>(() => new Set([state.routes[state.index].key]));
  const focusedKey = state.routes[state.index].key;
  if (!visited.has(focusedKey)) setVisited(new Set(visited).add(focusedKey));

  const focused = descriptors[focusedKey];
  const showHeader = focused.options.headerShown !== false;

  return (
    <NavigationContent>
      <View style={styles.flex}>
        {showHeader ? (
          <Header
            title={focused.options.title ?? state.routes[state.index].name}
            right={focused.options.headerRight?.()}
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          />
        ) : null}
        <HeaderHeightContext.Provider value={showHeader ? headerHeight : 0}>
          <View style={styles.flex}>
            {state.routes.map((route) =>
              visited.has(route.key) ? (
                <View key={route.key} style={[styles.flex, route.key !== focusedKey && styles.hidden]}>
                  {descriptors[route.key].render()}
                </View>
              ) : null,
            )}
          </View>
        </HeaderHeightContext.Provider>
        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]} accessibilityRole="tablist">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = index === state.index;
            const color = isFocused ? colors.primary : colors.textMuted;
            const label = options.tabBarLabel ?? options.title ?? route.name;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={label}
                style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.dispatch({ ...TabActions.jumpTo(route.name), target: state.key });
                  }
                }}
              >
                {options.tabBarIcon?.({ color, size: 24 })}
                <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </NavigationContent>
  );
}

// ---- Stack -----------------------------------------------------------------------------------

type StackProps = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  StackNavigationState<ParamListBase>,
  ScreenOptions,
  EventMap,
  NavigationProp<ParamListBase>
> &
  StackRouterOptions;

function StackNavigator({ id, initialRouteName, children, screenOptions }: StackProps) {
  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder<
    StackNavigationState<ParamListBase>,
    StackRouterOptions,
    StackActionHelpers<ParamListBase>,
    ScreenOptions,
    EventMap
  >(StackRouter, { id, initialRouteName, children, screenOptions });
  const [headerHeight, setHeaderHeight] = useState(0);

  const top = state.routes[state.index];
  const { options } = descriptors[top.key];
  const previous = state.index > 0 ? state.routes[state.index - 1] : null;
  const previousTitle = previous ? descriptors[previous.key]?.options.title ?? previous.name : '';
  const showHeader = options.headerShown !== false;

  return (
    <NavigationContent>
      <View style={styles.flex}>
        {showHeader ? (
          <Header
            title={options.title ?? top.name}
            right={options.headerRight?.()}
            back={
              previous
                ? { label: previousTitle, onPress: () => navigation.dispatch({ ...StackActions.pop(), target: state.key }) }
                : undefined
            }
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          />
        ) : null}
        <HeaderHeightContext.Provider value={showHeader ? headerHeight : 0}>
          {/* Lower screens stay mounted but hidden, so the patient list keeps its search and scroll. */}
          {state.routes.map((route, index) => (
            <View key={route.key} style={[styles.flex, index !== state.index && styles.hidden]}>
              {descriptors[route.key].render()}
            </View>
          ))}
        </HeaderHeightContext.Provider>
      </View>
    </NavigationContent>
  );
}

// ---- Factories and screen prop types ---------------------------------------------------------

type Bag<ParamList extends ParamListBase, State extends TabNavigationState<ParamList> | StackNavigationState<ParamList>, Helpers> = {
  ParamList: ParamList;
  NavigatorID: undefined;
  State: State;
  ScreenOptions: ScreenOptions;
  EventMap: EventMap;
  NavigationList: {
    [RouteName in keyof ParamList]: NavigationProp<ParamList, RouteName, undefined, State, ScreenOptions, EventMap> & Helpers;
  };
  Navigator: ComponentType<object>;
};

export function createTabNavigator<ParamList extends ParamListBase>() {
  return createNavigatorFactory(TabNavigator)() as unknown as TypedNavigator<
    Bag<ParamList, TabNavigationState<ParamList>, TabActionHelpers<ParamList>>
  >;
}

export function createStackNavigator<ParamList extends ParamListBase>() {
  return createNavigatorFactory(StackNavigator)() as unknown as TypedNavigator<
    Bag<ParamList, StackNavigationState<ParamList>, StackActionHelpers<ParamList>>
  >;
}

export type TabScreenProps<ParamList extends ParamListBase, RouteName extends keyof ParamList> = {
  navigation: NavigationProp<ParamList, RouteName, undefined, TabNavigationState<ParamList>, ScreenOptions, EventMap> &
    TabActionHelpers<ParamList>;
  route: RouteProp<ParamList, RouteName>;
};

export type StackScreenProps<ParamList extends ParamListBase, RouteName extends keyof ParamList> = {
  navigation: NavigationProp<ParamList, RouteName, undefined, StackNavigationState<ParamList>, ScreenOptions, EventMap> &
    StackActionHelpers<ParamList>;
  route: RouteProp<ParamList, RouteName>;
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hidden: { display: 'none' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  tab: { flex: 1, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
});
