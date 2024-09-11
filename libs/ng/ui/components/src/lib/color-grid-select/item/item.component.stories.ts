import type { Meta, StoryObj } from '@storybook/angular';
import {
  COLOR_GRID_ITEMS_DEFAULT,
  COLOR_GRID_ITEM_SIZES,
  ColorGridItemComponent,
} from './item.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<ColorGridItemComponent> = {
  component: ColorGridItemComponent,
  title: 'ItemComponent',
};
export default meta;
type Story = StoryObj<ColorGridItemComponent>;

export const Primary: Story = {
  args: {
    value: COLOR_GRID_ITEMS_DEFAULT[0],
    size: COLOR_GRID_ITEM_SIZES[0],
    checked: false,
  },
  argTypes: {
    value: {
      control: 'select',
      options: COLOR_GRID_ITEMS_DEFAULT,
    },
    size: {
      control: 'radio',
      options: COLOR_GRID_ITEM_SIZES,
    },
  },
};

export const Selected: Story = {
  args: {
    value: COLOR_GRID_ITEMS_DEFAULT[0],
    size: COLOR_GRID_ITEM_SIZES[0],
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    value: COLOR_GRID_ITEMS_DEFAULT[0],
    size: COLOR_GRID_ITEM_SIZES[0],
    checked: false,
    disabled: true,
  },
};

// Interaction Test: Simulate a click on the color item and verify selection
export const InteractionTest: Story = {
  args: {
    value: COLOR_GRID_ITEMS_DEFAULT[0], // Ensure this matches the test id
    size: COLOR_GRID_ITEM_SIZES[0],
    checked: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const colorItem = canvas.getByTestId('color-item-rgb(255, 0, 0)'); // Ensure this matches the test id in HTML
    colorItem.click(); // Simulate click
    await expect(colorItem).toHaveAttribute('aria-checked', 'true'); // Verify the aria-checked attribute updates
  },
};
