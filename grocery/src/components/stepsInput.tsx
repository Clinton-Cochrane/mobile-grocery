import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InstructionItem {
  key: string;
  value: string;
}

interface StepsInputProps {
  initialSteps: InstructionItem[];
  onStepsChange: (steps: InstructionItem[]) => void;
}

const StepsInput: React.FC<StepsInputProps> = ({
  initialSteps,
  onStepsChange,
}) => {
  const [steps, setSteps] = useState<InstructionItem[]>(initialSteps);

  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const addStep = () => {
    const updatedSteps = [...steps, { key: `${steps.length}`, value: '' }];
    setSteps(updatedSteps);
    onStepsChange(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    onStepsChange(updatedSteps);
  };

  const handleChangeStep = (text: string, index: number) => {
    const updatedSteps = [...steps];
    updatedSteps[index].value = text;
    setSteps(updatedSteps);
    onStepsChange(updatedSteps);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={steps}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.stepContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Step ${index + 1}`}
              value={item.value}
              onChangeText={(text) => handleChangeStep(text, index)}
            />
            <TouchableOpacity onPress={() => removeStep(index)}>
              <Icon name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <Button title="Add Step" onPress={addStep} />
        )}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardDismissMode="on-drag"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
});

export default StepsInput;
