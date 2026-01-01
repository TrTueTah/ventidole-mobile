import { Icon } from '@/components/ui';
import PostScreen from '@/screens/app/post/PostScreen';
import PostActionsBottomSheet from '@/screens/app/post/components/PostActionsBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import CustomScreenHeader from '../components/ScreenHeader';
import { postStackPath } from '../pathLocations';
const PostStack = createNativeStackNavigator();

const PostStackNavigator = ({ route }: { route: any }) => {
  const communityId = route?.params?.communityId;
  const postId = route?.params?.postId;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleGotoCommunity = () => {
    bottomSheetRef.current?.close();
    if (communityId) {
      navigation.navigate('CommunityStack', { communityId });
    }
  };

  const handleReport = () => {
    bottomSheetRef.current?.close();
    // TODO: Report logic
    console.log('Report post:', postId);
  };

  const handleEdit = () => {
    bottomSheetRef.current?.close();
    // TODO: Edit logic
    console.log('Edit post:', postId);
  };

  return (
    <>
      <PostStack.Navigator>
        <PostStack.Screen
          name={postStackPath}
          component={PostScreen}
          options={{
            headerShown: true,
            title: 'Post',
            headerRight: () => (
              <TouchableOpacity onPress={handleOpenBottomSheet}>
                <Icon name="EllipsisVertical" />
              </TouchableOpacity>
            ),
            header: props => <CustomScreenHeader {...props} />,
          }}
          initialParams={{ communityId, postId }}
        />
      </PostStack.Navigator>

      <PostActionsBottomSheet
        ref={bottomSheetRef}
        onGotoCommunity={handleGotoCommunity}
        onReport={handleReport}
        onEdit={handleEdit}
      />
    </>
  );
};

export default PostStackNavigator;
