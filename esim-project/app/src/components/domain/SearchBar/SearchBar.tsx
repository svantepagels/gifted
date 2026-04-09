import { Search } from 'lucide-react';
import { Input } from '../../ui/Input/Input';
import { useDestinationStore } from '../../../store/useDestinationStore';
import styles from './SearchBar.module.css';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useDestinationStore();

  return (
    <div className={styles.wrapper}>
      <Input
        placeholder="Search destinations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<Search size={20} strokeWidth={1.75} />}
        aria-label="Search destinations"
      />
    </div>
  );
}
