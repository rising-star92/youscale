import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CustumSelect } from '../Forms'
import { TutorialModal } from '../Modal'
import { FaUser } from 'react-icons/fa'
import { FiPackage } from 'react-icons/fi'
import { useGetProductQuery } from '../../services/api/ClientApi/ClientProductApi'
import { useGetTeamMemberQuery } from '../../services/api/ClientApi/ClientTeamMemberApi'
import { VideoModal } from '../Table/Modal/Video'
import { Filter } from '../Filter/Filter'
import { GetProductModel, GetTeamMemberModel } from '../../models'
import { usePatchClientMutation } from '../../services/api/ClientApi/ClientApi'
import { GetRole } from '../../services/storageFunc'
import CustumDateRangePicker from './CustumDateRangePicker'
import './styles.css'

interface Props {
  setDate?: React.Dispatch<React.SetStateAction<string[]>>;
  setProduct?: React.Dispatch<React.SetStateAction<string>>;
  setUsingDate?: React.Dispatch<React.SetStateAction<boolean>>;
  showDateFilter?: boolean;
  setIdTeam?: React.Dispatch<React.SetStateAction<number>>;
  showTeamFilter?: boolean;
  showProductFilter?: boolean;
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  urlVideo: string;
  closeTutorial: () => void;
  setShowVideo: React.Dispatch<React.SetStateAction<boolean>>;
  showVideo: boolean;
}

type dataType = {
  label: string;
  value: string;
}

const convertProduct = (data: GetProductModel[] | undefined): dataType[] => {
  if (!data) return [];

  var out: dataType[] = [];

  data.map((dt) => {
    if (!dt.isDeleted) {
      out.push({ label: dt.name, value: String(dt.id) });
    }
  });

  return out;
};

const convertTeamMember = (
  data: GetTeamMemberModel[] | undefined
): dataType[] => {
  if (!data) return [];

  var out: dataType[] = [{ label: "Aucun", value: String(0) }];

  data.map((dt) => {
    if (dt.active) {
      out.push({ label: dt.name ?? "", value: String(dt.id) });
    }
  });

  return out;
};

export default function Header({
  setDate,
  setUsingDate,
  showDateFilter,
  setProduct,
  showProductFilter,
  showTeamFilter,
  setIdTeam,
  name,
  showMenu,
  setShowMenu,
  urlVideo,
  closeTutorial,
  setShowVideo,
  showVideo,
}: Props): JSX.Element {
  const [patchClient] = usePatchClientMutation();
  const { data: productData } = useGetProductQuery({ isHidden: false });
  const { data: teamData } = useGetTeamMemberQuery({ isHidden: true });
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const NavExpanded = () => {
    setIsNavExpanded(!isNavExpanded);
    if (!isNavExpanded) {
      setShowMenu(false);
    }
  };

  const handleTeamChange = ({ label, value }: dataType) => {
    if (value === "") {
      setIdTeam && setIdTeam(-1);
      return;
    }

    setIdTeam && setIdTeam(Number(value));
  };

  const RenitilizeStep = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    patchClient({ isBeginner: true })
      .unwrap()
      .then((res) => {
        console.log(res);
        window.location.reload();
      })
      .catch((err) => console.warn(err));
  };

  const handleProductChange = ({ label, value }: dataType) => {
    if (value === "") return;

    setProduct && setProduct(value);
  };

  return (
    <>
      <TutorialModal
        setIsVisible={setShowVideo}
        isOpen={showVideo}
        urlVideo={urlVideo}
      />
      <div className="nav-header">
        <a href="/" className="brand-logo">
          <img
            src="/cus_img/Group15.png"
            alt="logo"
            className={showMenu ? "brand-title1 hidden" : "brand-title1"}
            width="124px"
            height="33px"
          />
          <img
            src="/cus_img/youscale.svg"
            alt="logo"
            className={showMenu ? "brand-title2" : "brand-title2 hidden"}
            width="124px"
            height="33px"
          />
        </a>
        <div onClick={() => setShowMenu(!showMenu)} className="nav-control">
          <div className={showMenu ? "hamburger is-active" : "hamburger"}>
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </div>
        </div>
      </div>

      <div className="header">
        <div className="header-content">
          <nav className="navbar navbar-expand">
            <button
              className="hamburger2"
              onClick={() => {
                NavExpanded();
              }}
            >
              {/* icon from heroicons.com */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="black"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="collapse navbar-collapse justify-content-between">
              <div className="header-left">
                <div className="dashboard_bar">{name}</div>
              </div>
              <div
                className={
                  isNavExpanded ? "navigation-menu expanded" : "navigation-menu"
                }
              >
              <ul className="navbar-nav header-right">
                <li className="nav-item" id='nav1'>
                  <a onClick={RenitilizeStep} href="#">Reprendre le tutoriel</a>
                </li>

                <li className="nav-item" id='nav2'>
                  {showProductFilter && <Filter Icons={FiPackage} label={'Produit'} data={convertProduct(productData?.data)} onChange={handleProductChange} />}
                </li>

                {
                  GetRole() === "CLIENT" &&
                  <li className="nav-item" id='nav3'>
                    {showTeamFilter && <Filter Icons={FaUser} label={'Team member'} data={convertTeamMember(teamData?.data)} onChange={handleTeamChange} />}
                  </li>
                }


                <li className="nav-item" id='nav4'>
                  {showDateFilter && <CustumDateRangePicker setDate={setDate} setUsingDate={setUsingDate} />}
                </li>

                <li className="nav-item" id='nav5'>
                  <Link
                    to={'/pack'}
                    className="nav-link"
                    onClick={(e) => {
                      Navigate({ to: '/pack' })
                      e.preventDefault()
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M31.4298 16.2424C32.5161 16.2424 32.9696 14.8467 32.0872 14.2034L18.661 4.43694C18.4693 4.29647 18.2378 4.22073 18.0001 4.22073C17.7624 4.22073 17.5309 4.29647 17.3392 4.43694L3.91299 14.2034C3.03056 14.8432 3.48408 16.2424 4.57392 16.2424H6.7501V29.3909H4.21885C4.06416 29.3909 3.9376 29.5174 3.9376 29.6721V31.5002C3.9376 31.6549 4.06416 31.7815 4.21885 31.7815H31.7813C31.936 31.7815 32.0626 31.6549 32.0626 31.5002V29.6721C32.0626 29.5174 31.936 29.3909 31.7813 29.3909H29.2501V16.2424H31.4298ZM13.3946 29.3909H9.28134V16.2424H13.3946V29.3909ZM20.0392 29.3909H15.9259V16.2424H20.0392V29.3909ZM26.7188 29.3909H22.5704V16.2424H26.7188V29.3909Z" fill="#111111" fill-opacity="0.85" />
                    </svg>
                  </Link>
                  <Link
                    to={'#'}
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowVideo(true)
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M18 2.25C9.30234 2.25 2.25 9.30234 2.25 18C2.25 26.6977 9.30234 33.75 18 33.75C26.6977 33.75 33.75 26.6977 33.75 18C33.75 9.30234 26.6977 2.25 18 2.25ZM23.066 18.2426L15.3879 23.8289C15.3458 23.8592 15.2962 23.8772 15.2445 23.8811C15.1928 23.885 15.141 23.8745 15.0949 23.8509C15.0488 23.8273 15.01 23.7914 14.9829 23.7472C14.9559 23.703 14.9415 23.6522 14.9414 23.6004V12.4348C14.9412 12.3828 14.9555 12.3319 14.9825 12.2875C15.0095 12.2431 15.0483 12.2071 15.0945 12.1835C15.1407 12.1598 15.1926 12.1494 15.2444 12.1534C15.2962 12.1575 15.3459 12.1757 15.3879 12.2063L23.066 17.7891C23.1023 17.8147 23.1319 17.8487 23.1523 17.8882C23.1727 17.9276 23.1834 17.9714 23.1834 18.0158C23.1834 18.0602 23.1727 18.104 23.1523 18.1435C23.1319 18.1829 23.1023 18.2169 23.066 18.2426Z" fill="#111111" fill-opacity="0.85" />
                    </svg>
                  </Link>
                </li>
              </ul>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
