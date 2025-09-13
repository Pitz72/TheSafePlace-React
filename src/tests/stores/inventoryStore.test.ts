import { jest } from '@jest/globals';
import { useInventoryStore } from '../../stores/inventory/inventoryStore';
import { useCharacterStore } from '../../stores/character/characterStore';
import { useNotificationStore } from '../../stores/notifications/notificationStore';
import { MessageType } from '../../data/MessageArchive';

// Mock the stores that inventoryStore interacts with
jest.mock('../../stores/character/characterStore');
jest.mock('../../stores/notifications/notificationStore');

describe('InventoryStore Refactored Actions', () => {
  const mockAddItemToInventory = jest.fn();
  const mockRemoveItemFromInventory = jest.fn();
  const mockAddLogEntry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations for the stores
    (useCharacterStore.getState as jest.Mock).mockReturnValue({
      addItemToInventory: mockAddItemToInventory,
      removeItemFromInventory: mockRemoveItemFromInventory,
      characterSheet: { // Provide a minimal sheet for removeItem to read from
        inventory: [{ itemId: 'CRAFT_WOOD', quantity: 5 }]
      }
    });
    (useNotificationStore.getState as jest.Mock).mockReturnValue({
      addLogEntry: mockAddLogEntry,
    });
  });

  describe('addItem', () => {
    test('should call characterStore.addItemToInventory and log on success', () => {
      mockAddItemToInventory.mockReturnValue(true); // Simulate success

      const result = useInventoryStore.getState().addItem('CRAFT_WOOD', 1);

      expect(mockAddItemToInventory).toHaveBeenCalledTimes(1);
      expect(mockAddItemToInventory).toHaveBeenCalledWith('CRAFT_WOOD', 1);
      expect(mockAddLogEntry).toHaveBeenCalledTimes(1);
      expect(mockAddLogEntry).toHaveBeenCalledWith(MessageType.ITEM_FOUND, { item: 'Legno di recupero', quantity: 1 });
      expect(result.success).toBe(true);
    });

    test('should call characterStore.addItemToInventory and log on failure', () => {
      mockAddItemToInventory.mockReturnValue(false); // Simulate failure (e.g., inventory full)

      const result = useInventoryStore.getState().addItem('CRAFT_WOOD', 1);

      expect(mockAddItemToInventory).toHaveBeenCalledTimes(1);
      expect(mockAddLogEntry).toHaveBeenCalledTimes(1);
      expect(mockAddLogEntry).toHaveBeenCalledWith(expect.stringContaining('INVENTORY_FULL'), expect.any(Object));
      expect(result.success).toBe(false);
    });
  });

  describe('removeItem', () => {
    test('should call characterStore.removeItemFromInventory and log on success', () => {
      mockRemoveItemFromInventory.mockReturnValue(true); // Simulate success

      const result = useInventoryStore.getState().removeItem(0, 1);

      expect(mockRemoveItemFromInventory).toHaveBeenCalledTimes(1);
      expect(mockRemoveItemFromInventory).toHaveBeenCalledWith(0, 1);
      expect(mockAddLogEntry).toHaveBeenCalledTimes(1);
      expect(mockAddLogEntry).toHaveBeenCalledWith(MessageType.ITEM_DROPPED, { item: 'Legno di recupero', quantity: 1 });
      expect(result.success).toBe(true);
    });

    test('should return failure if the slot is empty', () => {
        const result = useInventoryStore.getState().removeItem(1, 1); // Assuming slot 1 is empty

        expect(mockRemoveItemFromInventory).not.toHaveBeenCalled();
        expect(result.success).toBe(false);
    });
  });
});
