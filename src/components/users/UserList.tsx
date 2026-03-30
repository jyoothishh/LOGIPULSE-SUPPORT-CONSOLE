import React, { useState } from 'react';
import { UserInfo } from '../../types';
import { LANG_FLAGS, LANG_NAMES } from '../../constants';
import { Avatar } from '../common/Avatar';
import s from './UserList.module.css';

function fmtIdle(sec: number) {
  return sec < 60 ? `${Math.round(sec)}s idle` : `${Math.floor(sec/60)}m idle`;
}

const UserCard: React.FC<{ user:UserInfo; selected:boolean; unreadCount:number; onClick:()=>void }> =
  ({ user, selected, unreadCount, onClick }) => {
    const idle  = user.idleSeconds ?? 0;
    const is60  = idle >= 60;
    const stuck = user.hasAlert && user.stuckReason === 'RepeatedClicks';
    return (
      <div className={[s.card, selected?s.sel:'', is60?s.idleCard:'', stuck?s.stuckCard:''].join(' ')} onClick={onClick}>
        <div className={s.top}>
          <Avatar name={user.name} userId={user.id} size={30} showStatus isOnline={user.isOnline}/>
          <div className={s.info}>
            <div className={s.uname}>{user.name}</div>
            <div className={s.lang}>{LANG_FLAGS[user.lang]??'🌐'} {LANG_NAMES[user.lang]??user.lang}</div>
          </div>
          {unreadCount > 0 && <div className={s.badge}>{unreadCount}</div>}
        </div>
        <div className={s.pills}>
          {user.currentPage  && <span className={`${s.pill} ${s.pillPage}`}>📍 {user.currentPage}</span>}
          {is60              && <span className={`${s.pill} ${s.pillIdle}`}>⏱ {fmtIdle(idle)}</span>}
          {stuck             && <span className={`${s.pill} ${s.pillStuck}`}>⚠ Stuck</span>}
          {(user.totalClicks??0)>0 && <span className={`${s.pill} ${s.pillClicks}`}>×{user.totalClicks}</span>}
        </div>
      </div>
    );
  };

interface Props { users:UserInfo[]; selectedId:string|null; unread:Record<string,number>; onSelect:(id:string|null)=>void; }

export const UserList: React.FC<Props> = ({ users, selectedId, unread, onSelect }) => {
  const [q, setQ] = useState('');
  const filtered = q
    ? users.filter(u => u.name?.toLowerCase().includes(q.toLowerCase()) || LANG_NAMES[u.lang]?.toLowerCase().includes(q.toLowerCase()))
    : users;

  return (
    <aside className={s.aside}>
      <div className={s.head}>
        <div className={s.headLabel}>Users Online</div>
        <div className={s.search}>
          <span className={s.searchIco}>⌕</span>
          <input placeholder="Search users..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      <div className={s.list}>
        {filtered.length === 0
          ? <div className={s.empty}>{q ? 'No users match' : 'No users connected'}</div>
          : filtered.map(u => (
              <UserCard key={u.id} user={u} selected={selectedId===u.id}
                unreadCount={unread[u.id]??0}
                onClick={() => onSelect(selectedId===u.id ? null : u.id)}/>
            ))
        }
      </div>
    </aside>
  );
};
