
export interface VeoShot {
  shotNumber: number;
  duration: 8;
  prompt: string;
}


export interface VeoScene {
  sceneNumber: number;
  shots: VeoShot[];
}

export interface VeoPrompt {
  scenes: VeoScene[];
}