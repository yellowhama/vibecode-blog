# LoRA Training Instructions

## 1. Environment Status
- **Training Tool**: `Kohya_ss` is being installed at `F:\Aisaak\Projects\kohya_ss`.
- **Dataset Location**: `F:\Aisaak\Projects\vibecode-town\.vibecode\lora_training\dataset`
  - `15_HanaVibe`: Hana (Original Mad Scientist style)
  - `15_ChipVibe`: Chip (Newt Robot style)

## 2. Running the Tool
1. Once the installation script finishes, open a terminal in `F:\Aisaak\Projects\kohya_ss`.
2. Run `.\gui.bat` to launch the Kohya_ss interface.

## 3. Recommended Settings (RTX 4060 Ti 16GB)
- **Model**: Select `FLUX.1-dev` (FP8 version recommended).
- **Network Rank (Dim)**: 16
- **Network Alpha**: 16
- **Learning Rate**: 1e-4
- **Optimizer**: AdamW8bit
- **Precision**: bf16 (Mixed & Save)
- **Resolution**: 1024,1024
- **Gradient Checkpointing**: Enabled (Crucial for VRAM)

## 4. Dataset Configuration
- In the **Dataset** tab:
  - **Instance Prompt**: `HanaVibe` or `ChipVibe`
  - **Class Prompt**: `anime girl` or `robot`
  - **Training Directory**: `F:\Aisaak\Projects\vibecode-town\.vibecode\lora_training\dataset`
  - **Output Directory**: Create a folder like `F:\Aisaak\Projects\vibecode-town\.vibecode\lora_training\output`
