import {
  FloatingArrow,
  FloatingContext,
  FloatingPortal,
  ReferenceType,
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDelayGroupContext,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
} from '@floating-ui/react';
import { Transition } from '@headlessui/react';
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useRef,
  useState,
} from 'react';

interface TooltipProps {
  open?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  asChild?: boolean;
  children: React.ReactNode;
  content: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  open: controlledOpen,
  side = 'bottom',
  asChild = true,
  children,
  content,
}) => {
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    controlledOpen ?? false
  );

  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = setUncontrolledOpen;

  const { refs, context, floatingStyles } = useFloating({
    open,
    onOpenChange,
    whileElementsMounted: autoUpdate,
    placement: side,
    middleware: [
      offset(5),
      arrow({ element: arrowRef }),
      flip(),
      shift(),
      size(),
    ],
  });

  const { delay, isInstantPhase } = useDelayGroupContext();
  const hover = useHover(context, { move: false, delay: delay ?? 100 });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getFloatingProps, getReferenceProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <TooltipTrigger
        ref={refs.setReference}
        context={context}
        getReferenceProps={getReferenceProps}
        asChild={asChild}
      >
        {children}
      </TooltipTrigger>

      {open && (
        <FloatingPortal>
          <Transition
            appear={!isInstantPhase}
            show={true}
            enter='duration-100'
            enterFrom='opacity-0 -translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='duration-75'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 -translate-y-1'
          >
            <div
              {...getFloatingProps()}
              ref={refs.setFloating}
              style={floatingStyles}
              className='rounded-md bg-zinc-950/75 px-1.5 py-0.5 text-sm text-zinc-100'
            >
              <FloatingArrow
                ref={arrowRef}
                context={context}
                className='fill-zinc-950/75'
              />
              {content}
            </div>
          </Transition>
        </FloatingPortal>
      )}
    </>
  );
};
export const TooltipTrigger = forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & {
    asChild?: boolean;
    context: FloatingContext<ReferenceType>;
    getReferenceProps: (
      userProps?: React.HTMLProps<Element>
    ) => Record<string, unknown>;
  }
>(
  (
    { children, asChild = false, context, getReferenceProps, ...props },
    propRef
  ) => {
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    if (asChild && isValidElement(children)) {
      return cloneElement(
        children,
        getReferenceProps({
          ref,
          ...props,
          ...children.props,
          'data-state': context.open ? 'open' : 'closed',
        })
      );
    }

    return (
      <button
        ref={ref}
        type='button'
        data-state={context.open ? 'open' : 'closed'}
        className='cursor-default focus:outline-none'
        {...getReferenceProps(props)}
      >
        {children}
      </button>
    );
  }
);

export default Tooltip;
