import type { Meta, StoryObj } from '@storybook/angular';
import { ColorGridSelectComponent } from './color-grid-select.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { COLOR_GRID_ITEMS_DEFAULT, COLOR_GRID_ITEM_SIZES } from './item';

const meta: Meta<ColorGridSelectComponent> = {
  component: ColorGridSelectComponent,
  title: 'ColorGridSelectComponent',
  args: {
    value: COLOR_GRID_ITEMS_DEFAULT[0],
    itemSize: COLOR_GRID_ITEM_SIZES[0],
  },
  argTypes: {
    value: {
      control: 'select',
      options: COLOR_GRID_ITEMS_DEFAULT,
    },
    itemSize: {
      control: 'radio',
      options: COLOR_GRID_ITEM_SIZES,
    },
    valueChange: { action: 'valueChange' },
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  // render: (args) => ({
  //   props: args,
  //   template: `
  //   <brew-color-grid-select
  //     [value]="value"
  //     [itemSize]="itemSize"
  //     [valueChange]="valueChange($event)"
  //   />

  //   <button>Submit</button>
  // `,
  // }),
};
export default meta;
type Story = StoryObj<ColorGridSelectComponent>;

export const Primary: Story = {
  args: {},
};
