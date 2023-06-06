import * as RadixTooltip from '@radix-ui/react-tooltip';

interface TooltipProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  content: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  side = 'bottom',
  children,
  content,
}) => {
  return (
    <RadixTooltip.Root delayDuration={300}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align='center'
          sideOffset={1}
          className='tooltip-content rounded-md bg-zinc-950/75 px-1.5 py-0.5 text-sm text-zinc-100'
        >
          {content}
          <RadixTooltip.Arrow className='fill-current text-white dark:text-zinc-950/75' />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};

export default Tooltip;
