import { Icon } from '@/components/ui';
import { components } from '@/schemas/openapi';
import CreatePostModal, {
  CreatePostModalRef,
} from '@/screens/app/community/components/CreatePostModal';
import PostScreen from '@/screens/app/post/PostScreen';
import PostActionsBottomSheet from '@/screens/app/post/components/PostActionsBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import CustomScreenHeader from '../components/ScreenHeader';
import { postStackPath } from '../pathLocations';

type PostDto = components['schemas']['PostDto'];

const PostStack = createNativeStackNavigator();

const PostStackNavigator = ({ route }: { route: any }) => {
  const communityId = route?.params?.communityId;
  const postId = route?.params?.postId;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const editPostRef = useRef<CreatePostModalRef>(null);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentPost, setCurrentPost] = useState<PostDto | null>(null);

  const handleOpenBottomSheet = (post: PostDto) => {
    setCurrentPost(post);
    bottomSheetRef.current?.expand();
  };

  const handleGotoCommunity = () => {
    bottomSheetRef.current?.close();
    if (communityId) {
      navigation.navigate('CommunityStack', { communityId });
    }
  };

  const handleEditSuccess = () => {
    // Refresh the post data
    // The PostScreen will handle refreshing via its own hook
  };

  const handleEditPress = (post: PostDto) => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      editPostRef.current?.open(post);
    }, 300);
  };

  return (
    <>
      <PostStack.Navigator>
        <PostStack.Screen
          name={postStackPath}
          component={PostScreen}
          options={{
            headerShown: true,
            title: t('HEADER.POST'),
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  currentPost && handleOpenBottomSheet(currentPost)
                }
              >
                <Icon name="EllipsisVertical" className="text-foreground" />
              </TouchableOpacity>
            ),
            header: props => <CustomScreenHeader {...props} />,
          }}
          initialParams={{ communityId, postId, onPostLoaded: setCurrentPost }}
        />
      </PostStack.Navigator>

      {currentPost && (
        <PostActionsBottomSheet
          ref={bottomSheetRef}
          post={currentPost}
          onGotoCommunity={handleGotoCommunity}
          onEditSuccess={handleEditSuccess}
          onEditPress={handleEditPress}
        />
      )}

      <CreatePostModal ref={editPostRef} onSuccess={handleEditSuccess} />
    </>
  );
};

export default PostStackNavigator;
