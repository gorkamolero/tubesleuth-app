import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import { cn } from "~/lib/utils";

import { Sidebar } from "~/components/Sidebar";
import useLocalStorage from "~/hooks/use-local-storage";
import { Outlet } from "@remix-run/react";

const defaultLayout = [245, 800];
const defaultCollapsed = false;

const RootLayout = () => {
	const [isCollapsed, setIsCollapsed] = useLocalStorage(
		"collapsed",
		defaultCollapsed,
	);
	const [panelSizes, setPanelSizes] = useLocalStorage(
		"panelSizes",
		defaultLayout,
	);
	const sidebarPanelSizes = panelSizes[0];
	const mainPanelSizes = panelSizes[1];

	return (
		<ResizablePanelGroup
			direction="horizontal"
			onLayout={(sizes: number[]) => {
				setPanelSizes(sizes);
			}}
			className="flex h-full items-stretch"
		>
			<ResizablePanel
				defaultSize={sidebarPanelSizes}
				collapsedSize={4}
				collapsible={true}
				minSize={15}
				maxSize={20}
				onCollapse={() => {
					setIsCollapsed(true);
				}}
				onExpand={() => {
					setIsCollapsed(false);
				}}
				className={cn(
					isCollapsed &&
						"min-w-[50px] transition-all duration-300 ease-in-out",
				)}
			>
				<Sidebar isCollapsed={isCollapsed} />
			</ResizablePanel>

			<ResizableHandle withHandle />

			<ResizablePanel minSize={30} defaultSize={mainPanelSizes}>
				<div className="flex h-screen flex-1 flex-col">
					<Outlet />
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};

export default RootLayout;
