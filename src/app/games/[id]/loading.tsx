import { Skeleton } from "@/components/ui/skeleton";
import { PlusSquare } from "lucide-react";

export default function Loading() {
    return <SkeletonWaitingRoom />;
}

function SkeletonWaitingRoom() {
    return (
        <div className=" flex-1 p-4 flex justify-center items-center">
            <div className="bg-white w-full md:max-w-4xl rounded-lg shadow-lg">
                <div className="h-12 flex justify-between items-center border-b border-gray-200 m-4">
                    <div className="text-xl font-bold text-gray-700">
                        <Skeleton className="h-7 w-24 " />
                    </div>
                    <div className="text-sm font-base text-gray-500">
                        <Skeleton className="h-5 w-32" />
                    </div>
                </div>
                <div className="px-6">
                    {Array(1)
                        .fill("")
                        .map((_, i) => (
                            <SkeletonPlayerInfo key={i} />
                        ))}

                    <div className="flex bg-gray-200 justify-center items-center h-16 p-4 my-6  rounded-lg  shadow-inner">
                        <div className="flex items-center border border-gray-400 p-2 border-dashed rounded cursor-pointer">
                            <Skeleton className="h-10 w-40 " />
                        </div>
                    </div>
                </div>
                <div className="p-6 ">
                    <Skeleton className="h-10 w-[734px] rounded-xl" />
                </div>
            </div>
        </div>
    );
}

function SkeletonPlayerInfo() {
    return (
        <div className="flex justify-between items-center h-16 p-4 my-4 rounded-lg border border-gray-100 shadow-md">
            <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-2">
                    <div className="text-md font-semibold text-gray-600">
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="text-sm font-light text-gray-500">
                        <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                </div>
            </div>

            <div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        </div>
    );
}
