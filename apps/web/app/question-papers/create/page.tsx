import { Suspense } from 'react';
import PaperDesigner from './PaperDesigner';
import AppLoader from '../../../components/ui/AppLoader';

export default function Page() {
    return (
        <Suspense fallback={<AppLoader text="Loading Paper Designer..." />}>
            <PaperDesigner />
        </Suspense>
    );
}
