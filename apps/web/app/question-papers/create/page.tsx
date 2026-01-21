import { Suspense } from 'react';
import PaperDesigner from './PaperDesigner';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaperDesigner />
        </Suspense>
    );
}
