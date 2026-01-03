import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  TouchableOpacity,
  View,
} from 'react-native';

interface AccordionProps<T> {
  sections: T[];
  activeSections?: number[];
  renderHeader: (
    section: T,
    index: number,
    isActive: boolean,
  ) => React.ReactElement;
  renderContent: (
    section: T,
    index: number,
    isActive: boolean,
  ) => React.ReactElement;
  onChange?: (activeSections: number[]) => void;
  expandMultiple?: boolean;
  duration?: number;
  sectionContainerStyle?: object;
}

interface AccordionSectionProps<T> {
  section: T;
  index: number;
  isActive: boolean;
  onToggle: (index: number) => void;
  renderHeader: (
    section: T,
    index: number,
    isActive: boolean,
  ) => React.ReactElement;
  renderContent: (
    section: T,
    index: number,
    isActive: boolean,
  ) => React.ReactElement;
  duration: number;
  sectionContainerStyle?: object;
}

function AccordionSection<T>({
  section,
  index,
  isActive,
  onToggle,
  renderHeader,
  renderContent,
  duration,
  sectionContainerStyle,
}: AccordionSectionProps<T>) {
  const animatedController = useRef(
    new Animated.Value(isActive ? 1 : 0),
  ).current;
  const [bodySectionHeight, setBodySectionHeight] = useState<number>(0);
  const [heightMeasured, setHeightMeasured] = useState(false);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bodySectionHeight],
  });

  useEffect(() => {
    if (bodySectionHeight > 0) {
      if (!heightMeasured) {
        // First time: set value immediately without animation
        animatedController.setValue(isActive ? 1 : 0);
        setHeightMeasured(true);
      } else {
        // Subsequent toggles: animate
        Animated.timing(animatedController, {
          duration: duration,
          toValue: isActive ? 1 : 0,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }).start();
      }
    }
  }, [
    isActive,
    bodySectionHeight,
    animatedController,
    duration,
    heightMeasured,
  ]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && bodySectionHeight === 0) {
      setBodySectionHeight(height);
    }
  };

  return (
    <View style={sectionContainerStyle}>
      <TouchableOpacity onPress={() => onToggle(index)} activeOpacity={0.7}>
        {renderHeader(section, index, isActive)}
      </TouchableOpacity>
      <Animated.View
        style={{
          height: bodySectionHeight > 0 ? bodyHeight : undefined,
          overflow: 'hidden',
        }}
      >
        <View onLayout={handleLayout}>
          {renderContent(section, index, isActive)}
        </View>
      </Animated.View>
    </View>
  );
}

function Accordion<T>({
  sections,
  activeSections = [],
  renderHeader,
  renderContent,
  onChange,
  expandMultiple = false,
  duration = 300,
  sectionContainerStyle,
}: AccordionProps<T>) {
  const [expandedSections, setExpandedSections] =
    useState<number[]>(activeSections);

  useEffect(() => {
    setExpandedSections(activeSections);
  }, [activeSections]);

  const toggleSection = (index: number) => {
    let newExpandedSections: number[];

    if (expandedSections.includes(index)) {
      // Collapse section
      newExpandedSections = expandedSections.filter(i => i !== index);
    } else {
      // Expand section
      if (expandMultiple) {
        newExpandedSections = [...expandedSections, index];
      } else {
        newExpandedSections = [index];
      }
    }

    setExpandedSections(newExpandedSections);
    onChange?.(newExpandedSections);
  };

  return (
    <>
      {sections.map((section, index) => {
        const isActive = expandedSections.includes(index);

        return (
          <AccordionSection
            key={index}
            section={section}
            index={index}
            isActive={isActive}
            onToggle={toggleSection}
            renderHeader={renderHeader}
            renderContent={renderContent}
            duration={duration}
            sectionContainerStyle={sectionContainerStyle}
          />
        );
      })}
    </>
  );
}

export default Accordion;
