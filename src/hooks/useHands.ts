import { useState } from "react";

interface Props {
    selectedItem: number;
    totalItems: number; // 新增总数量参数
  }
  
  interface Return {
    onPrevious: () => void;
    onNext: () => void;
    selectedIndex: number; // 返回选中的索引
  }
  
  export const useHands = ({ selectedItem = 0, totalItems }: Props): Return => {
    const [selectedIndex, setSelectedIndex] = useState(selectedItem);
  
    const onPrevious = () => {
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    };
  
    const onNext = () => {
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    };
  
    return {
      onPrevious,
      onNext,
      selectedIndex,
    };
  };
  