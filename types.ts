
export interface VeoScene {
  sceneNumber: number;
  description: string;
}

export interface VeoPrompt {
  scenes: VeoScene[];
}