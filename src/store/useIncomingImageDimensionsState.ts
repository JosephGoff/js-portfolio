import { create } from "zustand";
import { ProjectEntryImage } from "../Pages/Projects/Projects";

type StateType = {
  incomingImageDimensions: ProjectEntryImage[]
  setIncomingImageDimensions: (newVal: ProjectEntryImage[]) => void;
};

const useIncomingImageDimensionsState = create<StateType>((set) => ({
  incomingImageDimensions: [],
  setIncomingImageDimensions: (newVal: ProjectEntryImage[]) =>
    set((state) => ({ incomingImageDimensions: newVal })),
}));

export default useIncomingImageDimensionsState;