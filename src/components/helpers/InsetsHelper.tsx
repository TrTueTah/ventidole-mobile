import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useAppStore} from "@/store/appStore";
import {useEffect} from "react";

export default function InsetsHelper() {
  const insets = useSafeAreaInsets();
  const setInsets = useAppStore(state => state.setInsets);

  useEffect(() => {
    setInsets(insets);
  }, [insets, setInsets]);
  return <></>
}
