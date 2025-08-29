import { Icon } from "@iconify/react/dist/iconify.js";

import './ListItemAvatar.css';


const ListItemAvatar = (params) => {

    return (
        <li key={params.id} onClick={() => {
            params.onClick();
        }} className={'ListItemAvatar '+params.className}>
            <img
            src={params.avatar || 'https://gpmgcm.ac.in/wp-content/uploads/2024/01/Default-Profile.jpg'}
            alt=""
            />
            <div className="ListItemInformation">
                <p className="LargeText">
                    {params.largeText}
                </p>
                <p className="SmallText">{params.smallText}</p>
            </div>
            {
                (params.status && 
                    <div className={"Status "+params.statusRaw}>
                        <p>{params.status}</p>
                        <Icon icon={params.icon} width={params.iconWidth} />
                    </div>
                )
            }
            
        </li>
    )
}

export default ListItemAvatar;