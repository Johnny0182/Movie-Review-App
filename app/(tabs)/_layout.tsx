import { icons } from "@/constants/icons";
import { Tabs } from 'expo-router';
import { Image, View } from 'react-native';

const TabIcon = ({ focused, icon, title }: any) => {
    return (
        <View className="flex-1 justify-center items-center mt-4">
            <Image 
                source={icon} 
                tintColor={focused ? "#ab8bff" : "#A8B5DB"} 
                className="size-5" 
            />
            {focused && (
                <View className="w-2 h-2 bg-accent rounded-full mt-2" />
            )}
        </View>
    )
}

const _layout = () => {
  return (
    <Tabs
        screenOptions={{
            tabBarShowLabel: false,
            tabBarItemStyle: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            },
            tabBarStyle: {
                backgroundColor: '#0f0D23',
                borderRadius: 50,
                marginHorizontal: 20,
                marginBottom: 36,
                height: 52,
                position: 'absolute',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#0f0d23',
            }
        }}>
        <Tabs.Screen
            name="index"
            options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon 
                    focused={focused} 
                    icon={icons.home} 
                    title="Home" 
                    />
                )
            }}
        />
        <Tabs.Screen
            name="search"
            options={{
                title: 'Search',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon 
                    focused={focused} 
                    icon={icons.search} 
                    title="Search" 
                    />
                )
            }}
        />
        <Tabs.Screen
            name="saved"
            options={{
                title: 'Saved',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon
                    focused={focused}
                    icon={icons.save}
                    title="Saved"
                    />
                )
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon
                    focused={focused}
                    icon={icons.person}
                    title="Profile"
                    />
                )
            }}
        />
    </Tabs>
  )
}

export default _layout